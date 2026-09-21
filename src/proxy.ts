import { NextResponse } from 'next/server';

// Later this will carry the /*.md rewrite and nothing else.
export function proxy() {
  return NextResponse.next();
}
