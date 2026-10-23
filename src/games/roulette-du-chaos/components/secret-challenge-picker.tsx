"use client";

import { useState } from "react";
import type { SecretChallengeRequest } from "../lib/game/types";

export function SecretChallengePicker({
  request,
  ownerName,
  onAccepted,
}: {
  request: SecretChallengeRequest;
  ownerName: string;
  onAccepted: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  return (
    <div className="secret-pick">
      <p className="secret-pick-owner">Mission pour {ownerName}</p>
      {visible ? (
        <>
          <p className="secret-pick-task">{request.task}</p>
          <p className="secret-pick-hint">Si personne ne devine ta mission, tu distribueras {request.rewardSips} gorgées en la révélant.</p>
          <button type="button" className="button button--primary" onClick={() => { setVisible(false); setSeen(true); }}>
            Masquer la mission
          </button>
        </>
      ) : (
        <>
          <p className="secret-pick-hint">Passe le téléphone à {ownerName}. Les autres détournent les yeux.</p>
          <button type="button" className="button button--primary" onClick={() => setVisible(true)}>
            {seen ? "Revoir ma mission" : "Je suis prêt·e, voir ma mission"}
          </button>
          {seen ? (
            <button type="button" className="button secret-pick-continue" onClick={onAccepted}>
              Mission mémorisée, continuer
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
