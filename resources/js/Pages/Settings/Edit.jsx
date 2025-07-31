import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, usePage } from '@inertiajs/react';
import ChatLayout from '@/Layouts/ChatLayout';

function Edit({ mustVerifyEmail, status }) {
    const page = usePage();

    return (
        <>
            
            <Head title="Settings" />

            <div className="w-full sm:px-6 lg:px-8 space-y-6 overflow-y-auto h-screen mb-16 sm:mb-0">
                <div className="p-4 sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>
                <div className="p-4 sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>
                <div className="p-4 sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </>
    );
}

Edit.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Edit;


