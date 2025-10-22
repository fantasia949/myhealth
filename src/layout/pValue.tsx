import React from 'react'
import Offcanvas from "react-bootstrap/Offcanvas";
import pcorrtest from '@stdlib/stats-pcorrtest'
import { BioMarker } from '../atom/dataAtom';

interface PValueProps {
  comparedSourceTarget: BioMarker[] | null;
  onClose: () => void;
}

export default React.memo(({ comparedSourceTarget, onClose }: PValueProps) => {
    const text: [string, string] | undefined = React.useMemo(() => {
        if (!Array.isArray(comparedSourceTarget)) {
            return
        }
        const [source, target] = comparedSourceTarget
        const sourceValues = source[1].map(v => (v ? +v : 0))
        const targetValues = target[1].map(v => (v ? +v : 0))
        const result = pcorrtest(sourceValues, targetValues, {
            alpha: 0.1,
            // alternative: "greater",
            // alternative: "less",
        })
        // console.log(result.print());
        return [result.print(), JSON.stringify(result, null, '\t')]
    }, [comparedSourceTarget])


    return (
        <Offcanvas show={!!text} onHide={onClose}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>P-Value</Offcanvas.Title>
            </Offcanvas.Header>
            {<Offcanvas.Body style={{ whiteSpace: 'pre-wrap', fontSize: 14 }} title={text?.[1]}>
                {!!text && comparedSourceTarget && <div>
                    {comparedSourceTarget[0][0]}
                    <span>=&gt;</span>
                    {comparedSourceTarget[1][0]}
                </div>}
                {text?.[0]}
            </Offcanvas.Body>}
        </Offcanvas>
    )
})
