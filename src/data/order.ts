import { useQuery } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
import {
  OrderQueryOptions,
  OrderPaginator,
  Order,
  InvoiceTranslatedText,
  CreateOrderInput,
} from '@/types';
import { orderClient } from './client/order';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { applyOrderTranslations } from '@/utils/format-ordered-product';
import { useState, useEffect } from 'react';
import { collection, doc, getDocs, onSnapshot, orderBy, query, where, limit as firestoreLimit, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

// export const useOrdersQuery = (
//   params: Partial<OrderQueryOptions>,
//   options: any = {}
// ) => {
//   const { locale } = useRouter();
//   const { data, error, isLoading } = useQuery<OrderPaginator, Error>(
//     [API_ENDPOINTS.ORDERS, params],
//     ({ queryKey, pageParam }) =>
//       orderClient.paginated(Object.assign({}, queryKey[1], pageParam)),
//     {
//       keepPreviousData: true,
//       ...options,
//       // enabled: isAuth(),
//     }
//   );
//   const res = data?.data ?? []
//   const orderTranlated = res.map((order) => applyOrderTranslations(order,locale ?? 'en'))
//   return {
//     orders: orderTranlated,
//     paginatorInfo: mapPaginatorData(data),
//     error,
//     loading: isLoading,
//   };
// };

const PAGE_LIMIT = 15; // Default page limit

export const useOrdersQuery = (params: Partial<OrderQueryOptions>, options: any = {}) => {
  const { locale } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0); // Total number of orders
  const notifiedOrderIds = new Set<string>();
  const {
    limit = PAGE_LIMIT,
    page = 1,
    orderBy: sortField = 'created_at',
    sortedBy = 'desc',
    type,
    tracking_number,
  } = params;

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const ordersCollection = collection(firestore, 'orders');
        let queryRef = query(ordersCollection);

        // Filter by `type`, `name`, `shop_id`, `tracking_number`, and `refund_reason` if provided
        
        if (tracking_number) {
          const prefixEnd = tracking_number.slice(0, -1) + String.fromCharCode(tracking_number.charCodeAt(tracking_number.length - 1) + 1);
          queryRef = query(queryRef, where('tracking_number', '>=', tracking_number), where('tracking_number', '<', prefixEnd));
        }
        

        // Order by field (e.g., 'created_at', 'total')
        queryRef = query(queryRef, orderBy(sortField, sortedBy));

        // Fetch the total number of orders for pagination
        const unsubscribeTotal = onSnapshot(collection(firestore, 'orders'), (snapshot) => {
          setTotalOrders(snapshot.size);
        });

        // Real-time updates for the current batch of orders
        const fetchLimit = limit * page;
        queryRef = query(queryRef, firestoreLimit(fetchLimit));

        const unsubscribe = onSnapshot(queryRef, (snapshot) => {
          const allOrders = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id, // Include the document ID
          })) as Order[];

          // Slice to return the requested page data
          const startIndex = (page - 1) * limit;
          const paginatedOrders = allOrders.slice(startIndex, startIndex + limit);
          allOrders.slice(0, 5).forEach((order) => {
            if (!order.is_seen && !notifiedOrderIds.has(order.id)) {
              toast.info(`New order received: #${order.tracking_number}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });

              notifiedOrderIds.add(order.id);
            }
          });
          setOrders(paginatedOrders);
          setIsLoading(false);
        });

        // Cleanup the listener when the component unmounts
        return () => {
          unsubscribe();
          unsubscribeTotal();
        };
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [type, tracking_number, sortedBy, sortField, page, limit]);

  const orderTranslated = orders.map((order) => applyOrderTranslations(order, locale ?? 'en'));
  const paginatorInfo = mapPaginatorData({
    total: totalOrders,
    current_page: page,
    last_page: Math.ceil(totalOrders / limit),
    //count: orderTranslated.length, // The number of orders in the current batch
    //firstItem: (page - 1) * limit + 1, // First item index on the current page
    //lastItem: Math.min(page * limit, totalOrders), // Last item index on the current page
    first_page_url: '',
    last_page_url: '',
    next_page_url: '',
    prev_page_url: '',
    from: 0,
    to: 0,
    links: [],
    path: '',
    per_page: limit,
    data: orderTranslated,
  });
  return {
    orders: orderTranslated,
    paginatorInfo: paginatorInfo,
    error,
    loading: isLoading,
  };
};

export const useOrderQuery = ({ id, language }: { id: string; language: string }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    // Reference to the specific order document in Firestore
    const orderDocRef = doc(firestore, `orders/${id}`);

    // Listen for real-time updates using onSnapshot
    const unsubscribe = onSnapshot(
      orderDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Order;
          setOrder(applyOrderTranslations({
            ...data,
            id: snapshot.id, // Add the document id to the order data
          }, language));
        } else {
          setOrder(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [id, language]);

  return {
    order,
    error,
    isLoading,
  };
};

// export const useOrderQuery = ({
//   id,
//   language,
// }: {
//   id: string;
//   language: string;
// }) => {
//   const { data, error, isLoading } = useQuery<Order, Error>(
//     [API_ENDPOINTS.ORDERS, { id, language }],
//     () => orderClient.get({ id, language }),
//     {
//       enabled: Boolean(id), // Set to true to enable or false to disable
//     }
//   );

//   return {
//     order: data ? applyOrderTranslations(data,language) : data,
//     error,
//     isLoading,
//   };
// };


// export const useCreateOrderMutation = () => {
//   return useMutation(orderClient.create);
// };

export function useCreateOrderMutation() {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  const { mutate: createOrder, isLoading } = useMutation(orderClient.create, {
    onSuccess: (data: any) => {
      if (data?.id) {
        router.push(`${Routes.order.list}/${data?.id}`);
      }
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};
      toast.error(data?.message);
    },
  });

  function formatOrderInput(input: CreateOrderInput) {
    const formattedInputs = {
      ...input,
      language: locale,
      // TODO: Make it for Graphql too
      invoice_translated_text: {
        subtotal: t('order-sub-total'),
        discount: t('order-discount'),
        tax: t('order-tax'),
        delivery_fee: t('order-delivery-fee'),
        total: t('order-total'),
        products: t('text-products'),
        quantity: t('text-quantity'),
        invoice_no: t('text-invoice-no'),
        date: t('text-date'),
      },
    };
    createOrder(formattedInputs);
  }

  return {
    createOrder: formatOrderInput,
    isLoading,
  };
}

export const useUpdateOrderMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(orderClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
    },
  });
};


export function useOrderSeen() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const {
    mutate: readOrderNotice,
    isLoading,
    isSuccess,
  } = useMutation(orderClient.orderSeen, {
    onSuccess: () => {},
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDER_SEEN);
    },
  });

  return { readOrderNotice, isLoading, isSuccess };
}
