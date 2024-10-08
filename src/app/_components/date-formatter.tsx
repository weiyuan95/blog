import { parseISO, format } from 'date-fns';

type Props = {
  dateString: string;
  className?: string;
};

export default function DateFormatter({ dateString, className }: Props) {
  const date = parseISO(dateString);
  return (
    <time className={className} dateTime={dateString}>
      {format(date, 'dd/MM/yyyy')}
    </time>
  );
}
