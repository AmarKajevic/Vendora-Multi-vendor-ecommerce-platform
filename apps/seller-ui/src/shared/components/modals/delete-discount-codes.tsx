import React  from "react";
import { X } from "lucide-react";

const DeleteDiscountCodeModal = ({discount, onClose, onConfirm}: {discount:any; onClose:() => void; onConfirm?:any}) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
           <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            {/* header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <h3 className="text-xl text-white">Delete discount code</h3>
                <button onClick={onClose} className=" text-gray-400 hover:text-white">
                    <X size={22}/>
                </button>

            </div>
            {/* warning message */}
            <p className="text-gray-300 mt-4">
                Are you sure you want to delete{ " "}
                <span className="font-semibodl text-white">
                    {discount.public_name}
                </span>
                ?
                <br/>
                This action cannot be undone.
            </p>
            <div className="flex justify-en gap-3 mt-6">
                <button
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white"
                >
                    Cancel
                    
                </button>
                <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-800 px-4 py-2 rounded-md text-white"
                >
                    Delete
                </button>
            </div>
           </div>
        </div>
    )
}

export default DeleteDiscountCodeModal