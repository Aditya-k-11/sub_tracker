import apiClient from './apiClient';

export const exportSubscriptions = async (format = 'csv') => {
  const response = await apiClient.get('/export/subscriptions', {
    params: { format },
    responseType: 'blob', // crucial for handling binary data
  });

  // Create a blob URL and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;

  // Extract filename from Content-Disposition header if possible, else generate one
  let fileName = `subtrack-export-${new Date().toISOString().split('T')[0]}.${format}`;
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
    if (fileNameMatch && fileNameMatch.length === 2) {
      fileName = fileNameMatch[1];
    }
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
};
