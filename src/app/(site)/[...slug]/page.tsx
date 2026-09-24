import { notFound } from 'next/navigation';

export { metadata } from '../not-found';

export default function CatchAll() {
  notFound();
}
