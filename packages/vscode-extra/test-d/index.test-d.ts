import { expectType } from 'tsd'
import { showQuickPick } from '../build'

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

void showQuickPick(
    ['yes', 'no'].map(val => ({ label: val, value: +val })),
    {
        onDidChangeActive(items) {
            expectType<number>(items[0]!.value)
        },
        //@ts-expect-error no available without canPickMany: true
        onDidChangeSelection(items) {},
    },
)

void showQuickPick(
    ['yes', 'no'].map(val => ({ label: val, value: +val })),
    {
        canPickMany: true,
        onDidChangeActive(items) {
            expectType<number>(items[0]!.value)
        },
        onDidChangeSelection(items) {
            expectType<number>(items[0]!.value)
        },
    },
)
