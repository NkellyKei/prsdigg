import { PageHeader, Tabs } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MyTransfersComponent from './components/MyTranfersComponent';

export default function RevenuePage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('dashboard.menu.revenue')} />
      <Tabs>
        <Tabs.TabPane
          tab={t('dashboard.revenue_page.author_transfers')}
          key='author'
        >
          <MyTransfersComponent transferType='author_revenue' />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={t('dashboard.revenue_page.reader_transfers')}
          key='reader'
        >
          <MyTransfersComponent transferType='reader_revenue' />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
