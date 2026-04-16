export function TestimonialCard({ testimonial, author, role, avatar }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg mx-2">
      <p className="mb-4 line-clamp-6 text-gray-700 text-sm min-h-[96px]">
        {testimonial}
      </p>
      <div className="flex items-center gap-4 mt-auto pt-4 border-t">
        <img
          src={avatar}
          alt={author}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold text-zinc-800">{author}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}
