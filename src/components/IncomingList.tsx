import React from 'react';
import { useWebId } from '@solid/react';
import { TripleSubject, Reference } from 'tripledoc';
import { schema, vcard } from 'rdf-namespaces';
import SolidAuth from 'solid-auth-client';
import { getIncomingRequests } from '../services/getIncomingRequests';
import { FriendRequest } from './FriendRequest';
import { getFriendLists } from '../services/getFriendList';
import { sendConfirmation } from '../services/sendFriendRequest';

async function removeRemoteDoc(url: string) {
  return await SolidAuth.fetch(url, {
    method: 'DELETE'
  });
}

export const IncomingList: React.FC = () => {
  const webId = useWebId();
  const [friendRequests, setFriendRequests] = React.useState<TripleSubject[]>();
  const [friendlists, setFriendlists] = React.useState<TripleSubject[] | null>();

  React.useEffect(() => {
    getIncomingRequests().then(setFriendRequests);
    getFriendLists().then(setFriendlists);
  }, [webId]);

  if (!friendRequests || !friendlists) {
    return (
      <p className="subtitle">Loading friend requests&hellip;</p>
    );
  }

  function acceptRequest(request: TripleSubject, targetList: Reference) {
    if (!friendlists) {
      throw new Error('Cannot accept the request because we cannot find your friend lists.');
    }

    const agentRef = request.getRef(schema.agent);
    if (!agentRef) {
      throw new Error('The friend request was malformed and could not be accepted.');
    }

    const friendlist = friendlists.find(list => list.asRef() === targetList);
    if (!friendlist) {
      throw new Error('Could not find the selected friend list.');
    }

    friendlist.addRef(vcard.hasMember, agentRef);
    friendlist.getDocument().save().then((updatedList) => {
      const newFriendlists = [...friendlists];
      newFriendlists[friendlists.indexOf(friendlist)] = updatedList.getSubject(friendlist.asRef());
      setFriendlists(newFriendlists);
      removeRemoteDoc(request.getDocument().asRef());
      sendConfirmation(agentRef);
    });
  }

  function rejectRequest(request: TripleSubject) {
    removeRemoteDoc(request.getDocument().asRef()).then(() => {
      setFriendRequests(oldRequests => (oldRequests || []).filter(oldRequest => oldRequest !== request));
    });
  }

  const requestElements = friendRequests.map((request) => {
    return (
      <FriendRequest
        key={request.asRef()}
        request={request}
        friendlists={friendlists}
        onAccept={(targetList) => acceptRequest(request, targetList)}
        onReject={() => rejectRequest(request)}
      />
    );
  });

  return (
    <div>
      <p className="panel-heading">Friend requests</p>
      {requestElements}
    </div>
  );
};
