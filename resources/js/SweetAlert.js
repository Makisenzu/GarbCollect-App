import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.css';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export const showAlert = (icon, title, text = '') => {
  return Swal.fire({
    icon,
    title,
    text,
    showConfirmButton: true,
  })
}

export const showToast = (icon, title) => {
  return Toast.fire({
    icon,
    title
  })
}

export const confirmDialog = (title, text, confirmText = 'Yes') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText
  }).then((result) => result.isConfirmed);
};

export default Swal