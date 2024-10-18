import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { getErrorMessage } from '@/utils/form-error';
import { useDeleteVacancyMutation } from '@/data/vacancy';

const VacancyDeleteView = () => {
  const { mutate: deleteVacancy, isLoading: loading } =
    useDeleteVacancyMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    try {
      deleteVacancy({
        id: data,
      });
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default VacancyDeleteView;
