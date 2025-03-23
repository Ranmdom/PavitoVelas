import { NextResponse } from 'next/server'

function safeStringify(data: any): string {
  return JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
}

export function jsonResponse(data: any, status = 200): NextResponse {
  return new NextResponse(safeStringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
