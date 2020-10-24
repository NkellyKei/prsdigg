class CreateArticles < ActiveRecord::Migration[6.0]
  def change
    create_table :articles do |t|
      t.uuid :uuid
      t.belongs_to :author
      t.string :title
      t.string :intro
      t.text :content
      t.uuid :asset_id, comment: 'asset_id in Mixin Network'
      t.decimal :price, null: false

      t.timestamps
    end

    add_index :articles, :uuid, unique: true
  end
end
