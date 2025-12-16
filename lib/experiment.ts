export type Variant = 'A' | 'B';


export interface Experiment {
id: string;
variant: Variant;
}

export function assignExperiment(id: string, variant:Variant): Experiment {
    const key = `exp:${id}`;
    const stored = localStorage.getItem(key);

    if (stored) {
        return {id, variant: stored as Variant}
    }

    localStorage.setItem(key, variant)

    return {id, variant}
}