import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,
		add: (message: string, type: Toast['type'] = 'info', duration = 3000) => {
			const id = crypto.randomUUID();
			const toast: Toast = { id, message, type, duration };
			
			update(toasts => [...toasts, toast]);
			
			// Auto remove after duration
			if (duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, duration);
			}
			
			return id;
		},
		remove: (id: string) => {
			update(toasts => toasts.filter(t => t.id !== id));
		},
		clear: () => {
			update(() => []);
		}
	};
}

export const toasts = createToastStore();