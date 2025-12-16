import { trackEvent } from "@/components/AnalyticsProvider";
import { assignExperiment, Variant } from "./experiment";

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