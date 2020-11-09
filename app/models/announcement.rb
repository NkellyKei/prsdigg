# frozen_string_literal: true

# == Schema Information
#
# Table name: announcements
#
#  id           :bigint           not null, primary key
#  content      :text
#  delivered_at :datetime
#  message_type :string
#  state        :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class Announcement < ApplicationRecord
  include AASM

  validates :content, presence: true
  validates :message_type, presence: true

  aasm column: :state do
    state :draft, initial: true
    state :delivered

    event :deliver, after: :touch_delivered_at do
      transitions from: :draft, to: :delivered_at
    end
  end

  def preview
    case message_type
    when 'PLAIN_TEXT'
      preview_as_text
    when 'PLAIN_POST'
      preview_as_post
    end
  end

  def deliver_to_users
    case message_type
    when 'PLAIN_TEXT'
      deliver_as_text
    when 'PLAIN_POST'
      deliver_as_post
    end

    deliver!
  end

  def preview_as_text
    message = MixinBot.api.plain_text(
      conversation_id: Rails.application.credentials.dig(:admin, :group_conversation_id),
      data: content
    )
    SendMixinMessageWorker.perform_async message
  end

  def preview_as_post
    message = MixinBot.api.plain_post(
      conversation_id: Rails.application.credentials.dig(:admin, :group_conversation_id),
      data: content
    )
    SendMixinMessageWorker.perform_async message
  end

  def deliver_as_post
    messages = User.pluck(:mixin_uuid).map do |uuid|
      MixinBot.api.plain_post(
        conversation_id: MixinBot.api.unique_conversation_id(uuid),
        data: content
      )
    end

    messages.each do |message|
      SendMixinMessageWorker.perform_async message
    end
  end

  def deliver_as_text
    messages = User.pluck(:mixin_uuid).map do |uuid|
      MixinBot.api.plain_text(
        conversation_id: MixinBot.api.unique_conversation_id(uuid),
        data: content
      )
    end

    messages.in_group_of(100, false).each do |message|
      SendMixinMessageWorker.perform_async message
    end
  end

  def touch_delivered_at
    update delivered_at: Time.current
  end
end
