# frozen_string_literal: true

# == Schema Information
#
# Table name: comments
#
#  id               :bigint           not null, primary key
#  commentable_type :string
#  content          :string
#  deleted_at       :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  author_id        :bigint
#  commentable_id   :bigint
#
# Indexes
#
#  index_comments_on_author_id                            (author_id)
#  index_comments_on_commentable_type_and_commentable_id  (commentable_type,commentable_id)
#
class Comment < ApplicationRecord
  include SoftDeletable

  belongs_to :author, class_name: 'User', inverse_of: :comments
  belongs_to :commentable, polymorphic: true, counter_cache: true

  validates :content, presence: true, length: { maximum: 1000 }

  after_commit :notify_subsribers_async, :subscribe_for_author, on: :create

  def subscribers
    @subscribers = commentable.commenting_subscribe_by_users.where.not(mixin_uuid: author.mixin_uuid)
  end

  def notification_text
    tpl = <<~TEXT
      %<author_name>s 在文章《%<article_title>s》发表了新的评论：

      %<content>s

      快去看看: %<article_url>s
    TEXT
    format(
      tpl,
      author_name: author.name,
      article_title: commentable.title,
      content: content.truncate(140),
      article_url: format(
        '%<host>s/articles/%<article_uuid>s',
        host: Rails.application.credentials.fetch(:host),
        article_uuid: commentable.uuid
      )
    )
  end

  def notify_subsribers_async
    messages = subscribers.pluck(:mixin_uuid).map do |_uuid|
      MixinBot.api.plain_text(
        conversation_id: MixinBot.api.unique_conversation_id(_uuid),
        recipient_id: _uuid,
        data: notification_text
      )
    end

    messages.in_groups_of(100, false).each do |message|
      SendMixinMessageWorker.perform_async message
    end
  end

  def subscribe_for_author
    author.create_action :commenting_subscribe, target: commentable
  end
end
