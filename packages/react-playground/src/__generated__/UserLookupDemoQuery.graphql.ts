/**
 * @generated SignedSource<<3bd73f0d459e045a3d63ec16cd481431>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserLookupDemoQuery$variables = {
  id: string;
};
export type UserLookupDemoQuery$data = {
  readonly user: {
    readonly avatar: string | null | undefined;
    readonly email: string;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type UserLookupDemoQuery = {
  response: UserLookupDemoQuery$data;
  variables: UserLookupDemoQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserLookupDemoQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserLookupDemoQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "67a418f070e161bfc049f72b2b8c4f15",
    "id": null,
    "metadata": {},
    "name": "UserLookupDemoQuery",
    "operationKind": "query",
    "text": "query UserLookupDemoQuery(\n  $id: ID!\n) {\n  user(id: $id) {\n    id\n    name\n    email\n    avatar\n  }\n}\n"
  }
};
})();

(node as any).hash = "50fd37914d8d9d210a81321db5771e3f";

export default node;
