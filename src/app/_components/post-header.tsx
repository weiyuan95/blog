import DateFormatter from './date-formatter';

type Props = {
  title: string;
  date: string;
};

export function PostHeader({ title, date }: Props) {
  return (
    <>
      <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tighter leading-tight md:leading-none my-16 text-center">
        {title}
      </h1>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-accent-7">
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  );
}
