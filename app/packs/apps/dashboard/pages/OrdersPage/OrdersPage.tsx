import { PageHeader, Tabs } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MyPaymentsComponent from './components/MyPaymentsComponent';
import MySwapOrderComponent from './components/MySwapOrdersComponent';

export default function OrdersPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t('dashboard.menu.orders')} />
      <Tabs>
        <Tabs.TabPane
          tab={t('dashboard.orders_page.tabs.payments')}
          key='payments'
        >
          <MyPaymentsComponent />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={t('dashboard.orders_page.tabs.swap_orders')}
          key='swapOrders'
        >
          <MySwapOrderComponent />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
