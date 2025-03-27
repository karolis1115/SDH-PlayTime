// NOTE(ynhhoJ): https://github.com/ricewind012/steam-sharedjscontext-types/blob/master/generated/SuspendResumeStore.ts
export interface SuspendResumeStore {
	m_bResuming: boolean;
	m_bShowResumeUI: boolean;
	m_bSuspending: boolean;
	m_cSuspendBlockers: number;
	m_eSuspendResumeProgress: number;
	m_nSuspendSleepMS: number;

	BShowSuspendResumeDialogs();
	BlockSuspendAction();
	GetSuspendResumeState();
	Init();
	InitiateResume();
	InitiateSleep();
	NotifyResumeUIDone();
}
