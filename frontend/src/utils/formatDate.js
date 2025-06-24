import moment from 'moment-timezone';

export const formatToIST = (dateString) => {
  if (!dateString) return 'N/A';
  return moment(dateString).tz('Asia/Kolkata').format('MMMM Do YYYY, h:mm:ss a');
}; 