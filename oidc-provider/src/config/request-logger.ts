import morgan, {StreamOptions} from 'morgan';
import express from 'express';

import Logger from './logger';

const skip = (req: express.Request, res: express.Response) => res.statusCode < 400;

const stream: StreamOptions = {
    write(value: string): void {
        Logger.error(value);
    }
};

export default morgan('combined', {
    stream,
    skip
});
