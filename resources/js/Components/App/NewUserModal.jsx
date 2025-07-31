import InputError from '../InputError';
import InputLabel from '../InputLabel';
import Modal from '../Modal';
import TextInput from '../TextInput';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { useForm } from '@inertiajs/react';    
import { useEventBus } from '@/EventBus';
import Checkbox from '../Checkbox';

export default function NewUserModal({ show = false, onClose = () => {} }) {
    const { emit } = useEventBus();

    const { data, setData, processing, reset, post, errors } = useForm({
        name: '',
        email: '',
        is_admin: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('user.store'), {
            onSuccess: () => {
                emit('toast.show', `User "${data.name}" was created`);
                closeModal();
            },
        });
    };

    const closeModal = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={closeModal}>
            <form 
                onSubmit={submit}
                className='p-6 overflow-y-auto'
            >
                <h2 className='text-xl font-medium text-gray-900 dark:text-gray-100'>
                    Create new User
                </h2>
                <div className='mt-8'>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                    />
                    <InputError className='mt-2' message={errors.name} />
                </div>
                <div className='mt-4'>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError className='mt-2' message={errors.email} />
                </div>
                <div className='mt-4'>
                <label className="flex items-center">
                        <Checkbox
                            name="is_admin"
                            checked={data.is_admin}
                            onChange={(e) => setData('is_admin', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Admin User
                        </span>
                    </label>
                    <InputError className='mt-2' message={errors.is_admin} />
                </div>
                <div className='mt-6 flex justify-end'>
                    <SecondaryButton onClick={closeModal}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton className='ms-3' disabled={processing}>
                        Create
                    </PrimaryButton> 
                </div>
            </form>
        </Modal>
    );
}

