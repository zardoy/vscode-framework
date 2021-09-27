import { showQuickPick } from '../build'
import { expectType } from 'tsd'

expectType<boolean | undefined>(
    await showQuickPick([
        {
            label: 'yes',
            value: true,
        },
        {
            label: 'no',
            value: false,
        },
    ]),
)
expectType<string[] | undefined>(
    await showQuickPick(
        ['yes', 'no'].map(val => ({ label: val, value: val })),
        {
            canPickMany: true,
        },
    ),
)
