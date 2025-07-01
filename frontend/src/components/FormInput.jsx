
const FormInput = ({
    id,
    type = 'text',
    label,
    icon,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    autoComplete = 'on',
    className = '',
    inputClassName = '',
    labelClassName = '',
    ...props
}) => {
    return (
        <div className={`animate-on-load opacity-0 translate-y-2 transition-all duration-200 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <label
                    className={`flex items-center text-[#14213D] text-sm font-bold ${labelClassName}`}
                    htmlFor={id}
                >
                    {icon && <span className="mr-2 text-[#FCA311]">{icon}</span>}
                    {label}
                    {required && <span className="ml-1 text-[#e48c00]">*</span>}
                </label>

                {props.actionLink && (
                    <div className="text-xs">{props.actionLink}</div>
                )}
            </div>

            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={`w-full px-3 py-2.5 rounded-sm border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9] focus:outline-none focus:shadow-[3px_0px_3px_#fca311] focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20
                    transition-all duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClassName}`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default FormInput;