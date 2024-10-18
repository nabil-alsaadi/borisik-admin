import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import Badge from '@/components/ui/badge/badge';
import { Router, useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NoDataFound } from '@/components/icons/no-data-found';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {
  Product,
  MappedPaginatorInfo,
  ProductType,
  Shop,
  SortOrder,
  VacancyApplication,
} from '@/types';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import dayjs from 'dayjs';
import ActionButtons from '../common/action-buttons';

export type IProps = {
  applications: VacancyApplication[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

type SortingObjType = {
  sort: SortOrder;
  column: string | null;
};

const VacancyApplicationList = ({
  applications,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {

  const router = useRouter();
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const [sortingObj, setSortingObj] = useState<SortingObjType>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );
      onOrder(column!);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  let columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 200,
      render: (id: number) => `#${id}`,
      //render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
        title: t('table:table-item-title'),
        className: 'cursor-pointer',
        dataIndex: 'name',
        key: 'name',
        align: alignLeft,
        width: 250,
        ellipsis: true,
        // onHeaderCell: () => onHeaderClick('name'),
        render: (
            name: string,
            {email} : any
        ) => (
            <div className="flex items-center">
                <div className="flex flex-col whitespace-nowrap font-medium ms-2">
                    {name}
                    <span className="text-[13px] font-normal text-gray-500/80">
                    {email}
                    </span>
                </div>
            </div>
        ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-date')}
          ascending={
            sortingObj?.sort === SortOrder?.Asc &&
            sortingObj?.column === 'created_at'
          }
          isActive={sortingObj?.column === 'created_at'}
          className="cursor-pointer"
        />
      ),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      align: alignLeft,
      onHeaderCell: () => onHeaderClick('created_at'),
      _render: (date: string) => {
          dayjs.extend(relativeTime);
          dayjs.extend(utc);
          dayjs.extend(timezone);
          return (
              <span className="whitespace-nowrap">
                  {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
              </span>
          );
      },
      get render() {
          return this._render;
      },
      set render(value) {
          this._render = value;
      },
    },
    {
        title: t('table:table-item-vacancy'),
        // dataIndex: 'vacancy.title',
        key: 'vacancy.title',
        align: alignLeft,
        width: 200,
        render: (record: any) => `${record?.vacancy?.title || ''}`,
        //render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: (id: string,slug: string, record: VacancyApplication) => (
        // <LanguageSwitcher
        //   slug={slug}
        //   record={record}
        //   deleteModalView="DELETE_PRODUCT"
        //   routes={Routes?.product}
        //   enablePreviewMode={true}
        // />
        <ActionButtons
            id={id}
            detailsUrl={`${router.asPath}/${id}`}
            customLocale={router.locale}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          /* @ts-ignore */
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={applications}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
            showLessItems
          />
        </div>
      )}
    </>
  );
};

export default VacancyApplicationList;
