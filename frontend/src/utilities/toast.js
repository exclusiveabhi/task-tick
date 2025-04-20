import Swal from 'sweetalert2';

export const showToast = (icon, title, text) => {
  Swal.fire({
    icon,
    title,
    text,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showAlert = (icon, title, text) => {
  Swal.fire({
    icon,
    title,
    text,
  });
};