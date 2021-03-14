import React from 'react'
import { NavLink } from 'react-router-dom'

function CustomNavLink({content}) {
    return (
        <NavLink
            to={content.toLowerCase()}
            activeClassName='bg-gray-900'
            className="inline-flex items-center py-3 px-3 my-9 mr-5 rounded hover:text-gray-200 text-1xl cursive">{content}</NavLink>
    )
}

export default CustomNavLink
