import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Toast({}) {
    const [toasts, setToasts] = useState([]);
    const { on } = useEventBus();

    useEffect(() => {
        on('toast.show', (message) => { 
            const uuid = uuidv4();
            setToasts((oldToasts) => [...oldToasts, { message, uuid }]);

            setTimeout(() => {
                setToasts((oldToasts) => oldToasts.filter((toast) => toast.uuid !== uuid));
            }, 5000);
        })
    }, [on]);
    
    return (
        <div className="pointer-events-none min-w-[280px] w-full xs:w-auto z-[9999] fixed top-4 right-4 md:top-8 md:right-8">
            {toasts.map((toast, index) => (
                <div 
                    key={toast.uuid} 
                    className="pointer-events-auto alert alert-success py-3 px-4 text-gray-100 rounded-md mb-2 shadow-lg transform transition-all duration-300 ease-in-out"
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}