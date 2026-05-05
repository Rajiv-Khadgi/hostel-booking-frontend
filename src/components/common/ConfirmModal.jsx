import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

/**
 * A premium, accessible confirmation modal using Headless UI.
 * @param {Object} props
 * @param {boolean} props.isOpen - Is the modal visible
 * @param {Function} props.onClose - Function to call on cancel/close
 * @param {Function} props.onConfirm - Function to call on confirm
 * @param {string} props.title - Modal title
 * @param {string} props.message - Descriptive message
 * @param {string} props.confirmText - Label for confirm button
 * @param {string} props.cancelText - Label for cancel button
 * @param {string} props.variant - 'danger' (red) or 'info' (emerald)
 */
export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Proceed', 
    cancelText = 'Cancel',
    variant = 'info' 
}) {
    const isDanger = variant === 'danger';
    
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-slate-100">
                                <div className="sm:flex sm:items-start">
                                    <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                                        isDanger ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {isDanger ? (
                                            <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
                                        )}
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all sm:ml-0 sm:w-auto ${
                                            isDanger 
                                                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600' 
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600'
                                        }`}
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                    >
                                        {confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all sm:mt-0 sm:w-auto"
                                        onClick={onClose}
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
