import { Avatar, Button, List, Space } from 'antd';
import LoadingComponent from 'apps/dashboard/components/LoadingComponent/LoadingComponent';
import { Order, useMyArticleOrderConnectionQuery } from 'graphqlTypes';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ArticleOrdersComponent(props: {
  uuid: string;
  orderType: 'buy_article' | 'reward_article';
}) {
  const { uuid, orderType } = props;
  const { t } = useTranslation();
  const { loading, data, fetchMore } = useMyArticleOrderConnectionQuery({
    variables: { uuid, orderType },
  });

  if (loading) {
    return <LoadingComponent />;
  }

  const {
    myArticleOrderConnection: {
      nodes: orders,
      pageInfo: { hasNextPage, endCursor },
    },
  } = data;

  return (
    <div>
      <List
        size='small'
        dataSource={orders}
        loadMore={
          hasNextPage && (
            <div
              style={{
                textAlign: 'center',
                marginTop: 12,
                height: 32,
                lineHeight: '32px',
              }}
            >
              <Button
                loading={loading}
                onClick={() => {
                  fetchMore({
                    variables: {
                      after: endCursor,
                      type: 'author',
                    },
                  });
                }}
              >
                {t('load_more')}
              </Button>
            </div>
          )
        }
        renderItem={(order: Partial<Order>) => (
          <List.Item key={order.traceId}>
            <Space>
              <Avatar src={order.buyer.avatarUrl}>{order.buyer.name[0]}</Avatar>
              <span>{order.buyer.name}</span>
              <span>
                {`${t('paid')} ${order.total} ${order.currency.symbol}`}
              </span>
              <span>
                {orderType == 'buy_article'
                  ? t('bought_article')
                  : t('rewarded_article')}
              </span>
            </Space>
            <div style={{ marginLeft: 'auto', color: '#aaa' }}>
              {moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
