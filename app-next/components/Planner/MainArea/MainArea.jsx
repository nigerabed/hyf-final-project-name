import styles from "./MainArea.module.css";
import InviteMembers from "../Sidebar/InviteMembers";
import GroupMembers from "./GroupMembers";

export default function MainArea({ isOwner, members, children }) {
  return (
    <div className={styles.mainContentPanel}>
      <div className={styles.topRowContainer}>
        {isOwner && (
          <div className={styles.topRowModule}>
            <InviteMembers />
          </div>
        )}
        <div className={styles.topRowModule}>
          <GroupMembers members={members} />
        </div>
      </div>

      {children}
    </div>
  );
}
