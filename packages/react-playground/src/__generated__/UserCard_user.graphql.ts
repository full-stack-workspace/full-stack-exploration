/**
 * @generated SignedSource<<38ca01947877ada2378d1d5da5abf088>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserCard_user$data = {
  readonly avatar: string | null | undefined;
  readonly email: string;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "UserCard_user";
};
export type UserCard_user$key = {
  readonly " $data"?: UserCard_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserCard_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserCard_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatar",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "11598fa6271a32ae041e983a550babe8";

export default node;
