interface QuantityProps {
    quantity: number,
    unit: string | null,
}

export default function Quantity({ quantity, unit }: QuantityProps) {
    return <span>{quantity}{unit}</span>;
}