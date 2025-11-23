export type players_network_data = {
    [key: string]: { position: { x: number; y: number }; color: string };
};

export type barrier_network_data = {
    [key: string]: {
        position: { x: number; y: number };
        angle: number;
        length: number;
    };
};

