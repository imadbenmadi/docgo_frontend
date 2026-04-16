import { useState } from "react";

function DragDropQuestion() {
    const [items, setItems] = useState([
        {
            id: "A",
            text: "A) Réalisation de recherches utilisateurs",
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/cc198fe37e7418fae30940e39cc5dedb85ede2a4?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
        },
        {
            id: "B",
            text: "B) Création de maquettes fil de fer",
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/73ac27543cc0ce751ade9d9484efdd03153d8cdf?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
        },
        {
            id: "C",
            text: "C) Test et itération",
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/15e6bd24c0f462f26f719140fb66eaa39b824835?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
        },
        {
            id: "D",
            text: "D) Prototypage",
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/0541dd121f6be66c7062389c6f93ec114b7225dd?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
        },
        {
            id: "E",
            text: "E) Design visuel",
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/2e8471ae651eadad14646515e96752cbc7c65067?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
        },
    ]);

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData("text/plain", index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

        if (dragIndex !== dropIndex) {
            const newItems = [...items];
            const draggedItem = newItems[dragIndex];
            newItems.splice(dragIndex, 1);
            newItems.splice(dropIndex, 0, draggedItem);
            setItems(newItems);
        }
    };

    return (
        <div className="mt-10 w-full text-zinc-800 max-md:max-w-full">
            <h2 className="text-2xl font-semibold text-zinc-800 max-md:max-w-full">
                Placez les étapes suivantes du processus de design dans le bon
                ordre :
            </h2>
            <div className="flex flex-col items-start mt-6 w-full text-xl leading-10 max-md:max-w-full">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex gap-4 items-center p-4 rounded-2xl border border border-solid max-md:max-w-full mt-4 first:mt-0 cursor-move hover:bg-gray-50 transition-colors"
                    >
                        <img
                            src={item.icon}
                            alt="Drag handle"
                            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                        />
                        <div className="self-stretch my-auto text-zinc-800">
                            {item.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DragDropQuestion;
