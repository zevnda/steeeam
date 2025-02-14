import { Fragment } from 'react';
import ThemeSwitch from './theme/ThemeSwitch';

export default function Footer() {
    return (
        <Fragment>
            <div className='flex justify-center items-center flex-col gap-2 w-full h-[100px] border-t border-light-border'>
                <div>
                    <p className='text-xs'>
                        Copyright © {new Date().getFullYear()} zevnda.
                    </p>
                </div>
                <ThemeSwitch />
            </div>
        </Fragment>
    );
}