import { SnackbarProvider } from 'notistack';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const snackbarIcons = {
  success: <FaCheckCircle className="mr-2 text-xl" />,
  error: <FaTimesCircle className="mr-2 text-xl" />,
  warning: <FaExclamationTriangle className="mr-2 text-xl" />,
  info: <FaInfoCircle className="mr-2 text-xl" />
};

const NotificationProvider = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      iconVariant={snackbarIcons}
      classes={{
        variantSuccess: "!bg-green-50 !text-green-800 !border-l-4 !border-green-500",
        variantError: "!bg-red-50 !text-red-800 !border-l-4 !border-red-500",
        variantWarning: "!bg-yellow-50 !text-yellow-800 !border-l-4 !border-yellow-500",
        variantInfo: "!bg-blue-50 !text-blue-800 !border-l-4 !border-blue-500",
      }}
      style={{ fontWeight: 500 }}
    >
      {children}
    </SnackbarProvider>
  );
};

export default NotificationProvider;