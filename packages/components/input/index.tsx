import { forwardRef } from "react";

interface BaseProps {
    label?: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  classname?: string;
}

type TextAreaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type Props = InputProps | TextAreaProps;
type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", classname, ...props }, ref) => {
    return (<div className="w-full ">
        {label && (
            <label className="block font-semibold text-gray-300 mb-1 ">
                {label}
            </label>
        )}
        {type === "textarea" ? (
            <textarea 
                ref = {ref as React.Ref<HTMLTextAreaElement>}
                className={ `w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${classname}` }
                {...(props as TextAreaProps)}
            />

            
        ) : (
            <input type={type} 
            ref={ref as React.Ref<HTMLInputElement>}
            className={ `w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${classname}` }
            {...(props as InputProps)}
            />
        )}
    </div>
    );
  },
);

Input.displayName = "Input";

export default Input;  
