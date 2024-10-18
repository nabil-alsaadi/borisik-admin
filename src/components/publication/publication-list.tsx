import Pagination from '@/components/ui/pagination';
import { Table, AlignType } from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Switch } from '@headlessui/react';
import { Attachment, Publication, SortOrder } from '@/types';
import { useUpdateAuthorMutationInList } from '@/data/author';
import { MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { useIsRTL } from '@/utils/locals';
import Avatar from '@/components/common/avatar';
import { NoDataFound } from '@/components/icons/no-data-found';

import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';


type IProps = {
  publications: Publication[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const PublicationList = ({
  publications,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { alignLeft } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
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
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('id'),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-title'),
      dataIndex: 'title',
      key: 'title',
      className: 'cursor-pointer',
      align: alignLeft,
      width: 220,
      onHeaderCell: () => onHeaderClick('title'),
    //   render: (title: string) => (
    //     <div className="flex items-center">
    //       {/* <Avatar name={name} src={image.thumbnail} /> */}
    //       <span className="whitespace-nowrap font-medium ms-2.5">{title}</span>
    //     </div>
    //   ),
    },
    // {
    //   title: t('table:table-item-products'),
    //   dataIndex: 'products_count',
    //   key: 'products_count',
    //   width: 160,
    //   align: 'center' as AlignType,
    // },
    // {
    //   title: t('table:table-item-approval-action'),
    //   dataIndex: 'is_approved',
    //   key: 'approve',
    //   align: 'center' as AlignType,
    //   width: 160,
    //   render: function Render(is_approved: boolean, record: any) {
    //     const { mutate: updateAuthor, isLoading: updating } =
    //       useUpdateAuthorMutationInList();

    //     function handleOnClick() {
    //       updateAuthor({
    //         language: router?.locale,
    //         id: record?.id,
    //         name: record?.name,
    //         is_approved: !is_approved,
    //       });
    //     }

    //     return (
    //       <>
    //         <Switch
    //           checked={is_approved}
    //           onChange={handleOnClick}
    //           className={`${
    //             is_approved ? 'bg-accent' : 'bg-gray-300'
    //           } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
    //           dir="ltr"
    //         >
    //           <span className="sr-only">Enable</span>
    //           <span
    //             className={`${
    //               is_approved ? 'translate-x-6' : 'translate-x-1'
    //             } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
    //           />
    //         </Switch>
    //       </>
    //     );
    //   },
    // },
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
      align: 'right',
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
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      width: 120,
      align: 'right' as AlignType,
      render: (slug: string, record: Publication) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_PUBLICATION"
          routes={Routes?.publications}
        />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter(
      (col) => col?.key !== 'approve' && col?.key !== 'actions'
    );
  }

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
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
          data={publications}
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
          />
        </div>
      )}
    </>
  );
};

export default PublicationList;
