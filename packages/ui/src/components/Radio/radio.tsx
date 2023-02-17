import { Radio as DefaultRadio } from 'antd'
import React, { useCallback } from 'react'

import { sendAnalyticsCheckEvent, extractChildrenContent } from '../_utils/analytics'
import { Typography } from '../Typography'

import type { TypographyTextProps } from '../Typography'
import type { RadioProps as DefaultRadioProps, RadioChangeEvent } from 'antd'

const RADIO_CLASS_PREFIX = 'condo-radio'

type CondoRadioProps = {
    label?: string
    labelProps?: TypographyTextProps
}

export type RadioProps = Pick<DefaultRadioProps, 'autoFocus' | 'defaultChecked' | 'disabled' | 'onChange' | 'checked' | 'value' | 'children' | 'id'>
& CondoRadioProps

export interface IRadio {
    (props: RadioProps): React.ReactElement
}

const Radio: IRadio = (props) => {
    const { label, labelProps, disabled, onChange, children, id, ...rest } = props

    const handleChange = useCallback((event: RadioChangeEvent) => {
        const stringContent = label ? label : extractChildrenContent(children)
        if (stringContent) {
            sendAnalyticsCheckEvent('Radio', { value: stringContent, id })
        }

        if (onChange) {
            onChange(event)
        }
    }, [label, children, onChange, id])

    return (
        <DefaultRadio
            {...rest}
            id={id}
            prefixCls={RADIO_CLASS_PREFIX}
            disabled={disabled}
            onChange={handleChange}
        >
            {
                label
                    ? <Typography.Text size='medium' disabled={disabled} {...labelProps}>{label}</Typography.Text>
                    : children
            }
        </DefaultRadio>
    )
}

export {
    Radio,
}