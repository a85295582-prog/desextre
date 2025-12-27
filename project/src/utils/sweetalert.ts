import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export async function showSuccess(message: string, title = 'Éxito') {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#d97706',
    confirmButtonText: 'Aceptar',
  });
}

export async function showError(message: string, title = 'Error') {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#d97706',
    confirmButtonText: 'Aceptar',
  });
}

export async function showWarning(message: string, title = 'Advertencia') {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#d97706',
    confirmButtonText: 'Aceptar',
  });
}

export async function showInfo(message: string, title = 'Información') {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#d97706',
    confirmButtonText: 'Aceptar',
  });
}

export async function showConfirm(message: string, title = '¿Estás seguro?') {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#d97706',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  });
}

export async function showDeleteConfirm(itemName: string) {
  return Swal.fire({
    icon: 'warning',
    title: '¿Eliminar este elemento?',
    html: `¿Estás seguro de eliminar <strong>${itemName}</strong>?<br>Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
}

export function showToastSuccess(message: string) {
  Toast.fire({
    icon: 'success',
    title: message,
  });
}

export function showToastError(message: string) {
  Toast.fire({
    icon: 'error',
    title: message,
  });
}

export function showToastInfo(message: string) {
  Toast.fire({
    icon: 'info',
    title: message,
  });
}
