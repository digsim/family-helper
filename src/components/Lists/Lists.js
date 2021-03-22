import React from 'react'
import { Item } from 'semantic-ui-react'
import List from './List';

function Lists({ list }) {
    return (
        <div>
            <ul>
                <div>
                    <Item.Group>
                        {list.map((item) => (
                            <List key={item.id} {...item} />
                        ))}
                    </Item.Group>
                </div>
            </ul>
        </div>
    )
}

export default Lists;