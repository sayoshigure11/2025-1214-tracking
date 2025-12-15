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

    // const variant: Variant = Math.random() < 0.5 ? "A" : "B"
    localStorage.setItem(key, variant)

    return {id, variant}
}