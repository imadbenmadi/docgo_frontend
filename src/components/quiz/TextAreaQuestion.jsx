import { useState } from "react";

function TextAreaQuestion({ question }) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="mt-6 w-full max-md:max-w-full">
      <h2 className="text-2xl font-semibold text-zinc-800 max-md:max-w-full">
        {question}
      </h2>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Écrivez ici votre réponse"
        className="flex gap-2 items-start px-4 pt-4 pb-36 mt-4 w-full text-xl leading-10 rounded-2xl border border border-solid min-h-48 text-neutral-600 max-md:pb-24 max-md:max-w-full resize-none"
      />
    </div>
  );
}

export default TextAreaQuestion;
