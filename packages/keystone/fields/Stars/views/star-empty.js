/** @jsx jsx */
import { jsx } from '@emotion/react'

export default function EmptyStar ({ onClick }) {
    return <svg
        onClick={onClick}
        width='22'
        height='21'
        viewBox='0 0 44 42'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            stroke='#BBB'
            strokeWidth='2'
            fill='#FFF'
            d='M22 30.972L10.244 39.18l4.175-13.717-11.44-8.643 14.335-.27L22 3l4.686 13.55 14.335.27-11.44 8.643 4.175 13.717z'
        />
    </svg>
}
