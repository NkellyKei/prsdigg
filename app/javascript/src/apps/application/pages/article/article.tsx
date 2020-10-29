import { ArticleQueryHookResult, useArticleQuery, User } from '@graphql';
import MDEditor from '@uiw/react-md-editor';
import copy from 'copy-to-clipboard';
import { encode as encode64 } from 'js-base64';
import { Avatar, Button, Col, Divider, message, Row, Space } from 'antd';
import { encode as encode64 } from 'js-base64';
import moment from 'moment';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Comments, Loading } from '../../components';
import {
  PRSDIGG_ICON_URL,
  useCurrentUser,
  useMixin,
  usePrsdigg,
} from '../../shared';
import { ShareAltOutlined } from '@ant-design/icons';

const traceId = uuid();
export function Article() {
  const { uuid } = useParams<{ uuid: string }>();
  const [paying, setPaying] = useState(false);
  const { appId } = usePrsdigg();
  const { mixinEnv } = useMixin();
  const currentUser = useCurrentUser();
  const { loading, data, refetch }: ArticleQueryHookResult = useArticleQuery({
    fetchPolicy: 'network-only',
    variables: { uuid },
  });

  const memo = encode64(
    JSON.stringify({
      t: 'BUY',
      a: uuid,
    }),
  );

  if (loading) {
    return <Loading />;
  }

  const { article } = data;

  const handlePaying = () => {
    setPaying(true);
    const payUrl = `https://mixin.one/pay?recipient=${appId}&trace=${traceId}&memo=${memo}&asset=${
      article.assetId
    }&amount=${article.price.toFixed(8)}`;
    location.replace(payUrl);
  };
  const handlePaid = () => {
    refetch();
    setPaying(false);
  };

  const handleShare = () => {
    const articleUrl = `${location.origin}/articles/${article.uuid}`;
    if (mixinEnv) {
      const data = {
        action: articleUrl,
        app_id: appId,
        description: `来自${article.author.name}的好文`,
        icon_url: PRSDIGG_ICON_URL,
        title: article.title.slice(0, 36),
      };
      location.replace(
        `mixin://send?category=app_card&data=${encodeURIComponent(
          encode64(JSON.stringify(data)),
        )}`,
      );
    } else {
      copy(articleUrl);
      message.success('成功复制链接');
    }
  };

  return (
    <div>
      <h1>{article.title}</h1>
      <div style={{ color: '#aaa', marginBottom: '1rem' }}>
        <Space>
          <Avatar size='small' src={article.author.avatarUrl} />
          <span>{article.author.name}</span>
          <span>{moment(article.createdAt).format('YYYY/MM/DD HH:mm')}</span>
        </Space>
      </div>
      <div
        style={{
          padding: '0.5rem 0.5rem',
          background: '#f4f4f4',
          marginBottom: '2rem',
        }}
      >
        {article.intro}
      </div>
      {article.authorized ? (
        <MDEditor.Markdown source={article.content} />
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p>
            付费继续阅读，并享受早期读者奖励（查看<Link to='/rules'>规则</Link>
            ）
          </p>
          <div>
            {currentUser ? (
              paying ? (
                <Button onClick={handlePaid}>支付完成</Button>
              ) : (
                <div>
                  <Button type='primary' onClick={handlePaying}>
                    付费阅读
                  </Button>
                  <div
                    style={{ marginTop: 10, fontSize: '0.8rem', color: '#aaa' }}
                  >
                    已经付款? <a onClick={() => refetch()}>刷新</a> 试试?
                  </div>
                </div>
              )
            ) : (
              <Button
                type='primary'
                href={`/login?redirect_uri=${encodeURIComponent(
                  location.href,
                )}`}
              >
                登录
              </Button>
            )}
          </div>
        </div>
      )}
      <div
        onClick={handleShare}
        style={{ margin: '20px 0', textAlign: 'right' }}
      >
        <Button type='link' icon={<ShareAltOutlined />}>
          分享
        </Button>
      </div>
      {article.readers.nodes.length > 0 && (
        <div>
          <Divider />
          <Row justify='center'>
            <Col>
              <h4>已付费读者</h4>
            </Col>
          </Row>
          <Row justify='center'>
            <Col>
              <Avatar.Group>
                {article.readers.nodes.map((reader: Partial<User>) => (
                  <Avatar key={reader.mixinId} src={reader.avatarUrl}>
                    {reader.name[0]}
                  </Avatar>
                ))}
              </Avatar.Group>
            </Col>
          </Row>
        </div>
      )}
      <Divider />
      <Comments
        commentableType='Article'
        commentableId={article.id}
        authorized={article.authorized}
      />
    </div>
  );
}
