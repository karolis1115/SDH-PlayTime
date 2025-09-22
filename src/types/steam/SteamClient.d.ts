// NOTE(ynhhoJ): https://github.com/voidiz/decky-window-switcher/blob/main/src/types.d.ts#L59
type ControllerStateChange = {
	unControllerIndex: number;
	unPacketNum: number;
	/**
	 * Bitmask representing pressed upper buttons.
	 * - Bit 0-8: Unknown (@todo Please provide more details if known)
	 * - Bit 9: L4
	 * - Bit 10: R4
	 * - Bit 11-13: Unknown (@todo Please provide more details if known)
	 * - Bit 14: Left Joystick Touch
	 * - Bit 15: Right Joystick Touch
	 * - Bit 16-17: Unknown (@todo Please provide more details if known)
	 * - Bit 18: Quick Access Menu
	 */
	ulUpperButtons: number;
	/**
	 * Bitmask representing pressed buttons.
	 * - Bit 0: R2
	 * - Bit 1: L2
	 * - Bit 2: R1
	 * - Bit 3: L1
	 * - Bit 4: Y
	 * - Bit 5: B
	 * - Bit 6: X
	 * - Bit 7: A
	 * - Bit 8: D-Pad Up
	 * - Bit 9: D-Pad Right
	 * - Bit 10: D-Pad Left
	 * - Bit 11: D-Pad Down
	 * - Bit 12: Select
	 * - Bit 13: Steam/Home
	 * - Bit 14: Start
	 * - Bit 15: L5
	 * - Bit 16: R5
	 * - Bit 17: Left Touchpad Click
	 * - Bit 18: Right Touchpad Click
	 * - Bit 19: Left Touchpad Touch
	 * - Bit 20: Right Touchpad Touch
	 * - Bit 21: Unknown (@todo Please provide more details if known)
	 * - Bit 22: L3
	 * - Bit 23-25: Unknown (@todo Please provide more details if known)
	 * - Bit 26: R3
	 * - Bit 27-28: Unknown (@todo Please provide more details if known)
	 * - Bit 29: Mute (Dualsense)
	 * - Bit 30-31: Unknown (@todo Please provide more details if known)
	 */
	ulButtons: number;
	sLeftPadX: number;
	sLeftPadY: number;
	sRightPadX: number;
	sRightPadY: number;
	sCenterPadX: number;
	sCenterPadY: number;
	sLeftStickX: number;
	sLeftStickY: number;
	sRightStickX: number;
	sRightStickY: number;
	sTriggerL: number;
	sTriggerR: number;
	flTrustedGravityVectorX: number;
	flTrustedGravityVectorY: number;
	flTrustedGravityVectorZ: number;
	flSoftwareQuatW: number;
	flSoftwareQuatX: number;
	flSoftwareQuatY: number;
	flSoftwareQuatZ: number;
	flSoftwareGyroDegreesPerSecondPitch: number;
	flSoftwareGyroDegreesPerSecondYaw: number;
	flSoftwareGyroDegreesPerSecondRoll: number;
	flHardwareQuatW: number;
	flHardwareQuatX: number;
	flHardwareQuatY: number;
	flHardwareQuatZ: number;
	flHardwareGyroDegreesPerSecondPitch: number;
	flHardwareGyroDegreesPerSecondYaw: number;
	flHardwareGyroDegreesPerSecondRoll: number;
	flGyroNoiseLength: number;
	flGyroCalibrationProgress: number;
	flGravityVectorX: number;
	flGravityVectorY: number;
	flGravityVectorZ: number;
	flAccelerometerNoiseLength: number;
	sBatteryLevel: number;
	sPressurePadLeft: number;
	sPressurePadRight: number;
	sPressureBumperLeft: number;
	sPressureBumperRight: number;
	unHardwareUpdateInMicrosec: number;
};

enum ControllerInputGamepadButton {
	GAMEPAD_BUTTON_A = 0,
	GAMEPAD_BUTTON_B = 1,
	GAMEPAD_BUTTON_X = 2,
	GAMEPAD_BUTTON_Y = 3,
	GAMEPAD_BUTTON_DPAD_UP = 4,
	GAMEPAD_BUTTON_DPAD_RIGHT = 5,
	GAMEPAD_BUTTON_DPAD_DOWN = 6,
	GAMEPAD_BUTTON_DPAD_LEFT = 7,
	GAMEPAD_BUTTON_MENU = 8,
	GAMEPAD_BUTTON_VIEW = 9,
	GAMEPAD_LEFTPAD_UP = 10,
	GAMEPAD_LEFTPAD_DOWN = 11,
	GAMEPAD_LEFTPAD_LEFT = 12,
	GAMEPAD_LEFTPAD_RIGHT = 13,
	GAMEPAD_LEFTPAD_ANALOG = 14,
	GAMEPAD_RIGHTPAD_UP = 15,
	GAMEPAD_RIGHTPAD_DOWN = 16,
	GAMEPAD_RIGHTPAD_LEFT = 17,
	GAMEPAD_RIGHTPAD_RIGHT = 18,
	GAMEPAD_RIGHTPAD_ANALOG = 19,
	GAMEPAD_LEFTSTICK_UP = 20,
	GAMEPAD_LEFTSTICK_DOWN = 21,
	GAMEPAD_LEFTSTICK_LEFT = 22,
	GAMEPAD_LEFTSTICK_RIGHT = 23,
	GAMEPAD_LEFTSTICK_ANALOG = 24,
	GAMEPAD_LEFTSTICK_CLICK = 25,
	GAMEPAD_LTRIGGER_ANALOG = 26,
	GAMEPAD_RTRIGGER_ANALOG = 27,
	GAMEPAD_BUTTON_LTRIGGER = 28,
	GAMEPAD_BUTTON_RTRIGGER = 29,
	GAMEPAD_BUTTON_LSHOULDER = 30,
	GAMEPAD_BUTTON_RSHOULDER = 31,
	GAMEPAD_BUTTON_LBACK = 32,
	GAMEPAD_BUTTON_RBACK = 33,
	GAMEPAD_BUTTON_GUIDE = 34,
	GAMEPAD_BUTTON_SELECT = 35,
	GAMEPAD_BUTTON_START = 36,
	GAMEPAD_BUTTON_LPAD_CLICKED = 37,
	GAMEPAD_BUTTON_LPAD_TOUCH = 38,
	GAMEPAD_BUTTON_RPAD_CLICKED = 39,
	GAMEPAD_BUTTON_RPAD_TOUCH = 40,
	GAMEPAD_RIGHTSTICK_CLICK = 41,
	GAMEPAD_RIGHTSTICK_TOUCH = 42,
	GAMEPAD_LEFTSTICK_TOUCH = 43,
	GAMEPAD_BUTTON_LBACK_UPPER = 44,
	GAMEPAD_BUTTON_RBACK_UPPER = 45,
	GAMEPAD_BUTTON_LAST = 46,
	GAMEPAD_ANALOG_SCROLL = 47,
	GAMEPAD_ANALOG_LEFT_KEYBOARD_CURSOR = 48,
	GAMEPAD_ANALOG_RIGHT_KEYBOARD_CURSOR = 49,
	GAMEPAD_ANALOG_LAST = 50,
}

interface SteamClient {
	Apps: {
		// NOTE(ynhhoJ): https://github.com/BossSloth/SteamTypes/blob/5e5df06cdef5d202e62e43423167415b05c3d6a5/src/types/SteamClient/Apps.ts#L361
		/**
		 * Registers a callback function to be called when app details change.
		 * @param appId The ID of the application to monitor.
		 * @param callback The callback function to be called.
		 * @returns An object that can be used to unregister the callback.
		 */
		RegisterForAppDetails(
			appId: number,
			callback: (appDetails: AppDetails) => void,
		): Unregisterable;
	};

	Input: {
		RegisterForControllerStateChanges: (
			callback: (controllerStateChanges: ControllerStateChange[]) => void,
		) => Unregisterable;

		RegisterForControllerInputMessages(
			callback: (
				controllerIndex: number,
				gamepadButton: ControllerInputGamepadButton,
				isButtonPressed: boolean,
			) => void,
		): Unregisterable;
	};

	User: {
		RegisterForLoginStateChange: (
			callback: (username: string) => void,
		) => Unregisterer;
		RegisterForPrepareForSystemSuspendProgress?: (
			callback: () => void,
		) => Unregisterable;
		RegisterForResumeSuspendedGamesProgress?: (
			callback: () => void,
		) => Unregisterable;
	};

	System: {
		RegisterForOnResumeFromSuspend?: (callback: () => void) => Unregisterable;
		RegisterForOnSuspendRequest?: (callback: () => void) => Unregisterable;
	};

	Storage: {
		GetJSON(key: string): Promise<string>;
		SetObject<T>(key: string, value: unknown): T;
	};
}
