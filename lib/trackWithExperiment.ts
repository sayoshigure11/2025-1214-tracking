import { assignExperiment, Variant } from "./experiment";
import { trackEvent } from "./track";

export function trackWithExperiment(
    abVariant: Variant,
    experimentId: string,
    type: string,
    // payload:unknown
    payload: any
) {
    const exp = assignExperiment(experimentId, abVariant)

    trackEvent(type, {
        ...payload,
        experimentId: exp.id,
        variant: exp.variant
    })

    return exp.variant
}